package com.guidemehome.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.guidemehome.utility.AuthenticatedUserIdProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ExecutionException;

import com.guidemehome.utility.AuthenticatedUserIdProvider;

@Service
@RequiredArgsConstructor
public class InvitationService {

    @Autowired
    private Firestore firestore;

    @Autowired
    private FirebaseAuth firebaseAuth;

    @Autowired
    private EmailService emailService;

//    private final AuthenticatedUserIdProvider authenticatedUserIdProvider;

    public void sendInvitationRequest(String senderId, String recipientEmail, String defaultBackendApiUrl) throws ExecutionException, InterruptedException {
        // Obține UUID-ul utilizatorului din Firebase Authentication
        UserRecord recipientRecord;
        UserRecord senderRecord;
        try {
            recipientRecord = firebaseAuth.getUserByEmail(recipientEmail);
        } catch (FirebaseAuthException e) {
            throw new IllegalArgumentException("Utilizatorul cu acest email nu există în Firebase Authentication!");
        }

        try{
            senderRecord = firebaseAuth.getUser(senderId);
        } catch (FirebaseAuthException e) {
            throw new IllegalArgumentException("Utilizatorul cu acest email nu există în Firebase Authentication!");
        }

        String recipientId = recipientRecord.getUid();
        String senderEmail = senderRecord.getEmail();

        // Verifică dacă utilizatorul există în colectia assistants
        DocumentReference assistantRef = firestore.collection("assistants").document(recipientId);
        ApiFuture<DocumentSnapshot> future = assistantRef.get();
        DocumentSnapshot document = future.get();

        if (!document.exists()) {
            throw new IllegalArgumentException("Utilizatorul nu există în colectia assistants!");
        }

        String token = UUID.randomUUID().toString();
        // Creează un document în colectia pending_requests
//        final var userId = authenticatedUserIdProvider.getUserId();
        Map<String, Object> request = new HashMap<>();
        request.put("token", token);
        request.put("senderId", senderId); //
        request.put("recipientId", recipientId);
        request.put("createdAt", Timestamp.now());
        request.put("expiresAt", Timestamp.now().toDate().toInstant().plus(48, ChronoUnit.HOURS));

        firestore.collection("pending_requests").add(request);

        // Trimite e-mail destinatarului
        String tokenUrl = defaultBackendApiUrl + "/api/v1/invitation/accept?token=" + token;
        emailService.sendInvitation(senderEmail, recipientEmail, tokenUrl);
    }

    public String acceptInvitationRequest(String token) throws ExecutionException, InterruptedException {
        // Verifică dacă cererea este validă
        CollectionReference pendingRequestsRef = firestore.collection("pending_requests");
        Query query = pendingRequestsRef.whereEqualTo("token", token);
        ApiFuture<QuerySnapshot> querySnapshot = query.get();

        if (querySnapshot.get().isEmpty()) {
            throw new IllegalArgumentException("Invitația nu este validă sau a expirat!");
        }

        DocumentSnapshot requestDoc = querySnapshot.get().getDocuments().get(0);

        // Preia expiresAt ca Map și extrage valorile
        Map<String, Object> expiresAtMap = (Map<String, Object>) requestDoc.get("expiresAt");
        Long epochSecond = (Long) expiresAtMap.get("epochSecond");
        Integer nano = ((Long) expiresAtMap.get("nano")).intValue();

        // Construiește un Instant și convertește într-un obiect Date
        Instant expiresAtInstant = Instant.ofEpochSecond(epochSecond, nano);
        Date expiresAtDate = Date.from(expiresAtInstant);

        // Verifică dacă invitația a expirat
        if (expiresAtDate.before(new Date())) {
            pendingRequestsRef.document(requestDoc.getId()).delete();
            throw new IllegalArgumentException("Invitația a expirat!");
        }

        String senderId = requestDoc.getString("senderId");
        String recipientId = requestDoc.getString("recipientId");

        // Referința către documentul din Firestore
        DocumentReference userRef = firestore.collection("users").document(senderId);
        DocumentReference assistantRef = firestore.collection("assistants").document(recipientId);

        // Adaugă recipientId în câmpul assistants, care este un array
        userRef.update("assistants", FieldValue.arrayUnion(recipientId));
        assistantRef.update("assistedUser", senderId);


        // Șterge cererea
        pendingRequestsRef.document(requestDoc.getId()).delete();

        return "Cererea a fost acceptată!";
    }
}
