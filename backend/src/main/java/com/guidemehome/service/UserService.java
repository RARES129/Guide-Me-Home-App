package com.guidemehome.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.guidemehome.client.FirebaseAuthClient;
import com.guidemehome.dto.TokenSuccessResponseDto;
import com.guidemehome.dto.UserCreationRequestDto;
import com.guidemehome.dto.UserLoginRequestDto;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord.CreateRequest;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final Firestore firestore;
    private final FirebaseAuth firebaseAuth;
    private final FirebaseAuthClient firebaseAuthClient;

    @SneakyThrows
    public void create(@NonNull final UserCreationRequestDto userCreationRequest) {
        final var request = new CreateRequest();
        request.setEmail(userCreationRequest.getEmail());
        request.setPassword(userCreationRequest.getPassword());
        request.setEmailVerified(Boolean.TRUE);

        try {
            UserRecord userRecord = firebaseAuth.createUser(request);
            Map<String, Object> userProfile = new HashMap<>();
            userProfile.put("email", userCreationRequest.getEmail());
//            userProfile.put("role", userCreationRequest.getRole());
            if (userCreationRequest.getRole().equals("user")) {
                firestore.collection("users").document(userRecord.getUid()).set(userProfile);
            } else if (userCreationRequest.getRole().equals("assistant")) {
                firestore.collection("assistants").document(userRecord.getUid()).set(userProfile);
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role must be either 'user' or 'admin'");
            }
        } catch (final FirebaseAuthException exception) {
            if (exception.getMessage().contains("EMAIL_EXISTS")) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Account with provided email-id already exists");
            }
            throw exception;
        }
    }

    public TokenSuccessResponseDto login(@NonNull final UserLoginRequestDto userLoginRequest) throws FirebaseAuthException {
        return firebaseAuthClient.login(userLoginRequest);
    }

    public List<String> getAllAssistants(String userId) throws ExecutionException, InterruptedException, IllegalArgumentException {
        // Reference to the user document
        DocumentReference userRef = firestore.collection("users").document(userId);

        // Fetch the user document
        ApiFuture<DocumentSnapshot> userFuture = userRef.get();
        DocumentSnapshot userDocument = userFuture.get();

        if (!userDocument.exists()) {
            throw new IllegalArgumentException("User not found!");
        }

        // Retrieve the list of assistant IDs from the user document
        List<String> assistantIds = (List<String>) userDocument.get("assistants");
        if (assistantIds == null || assistantIds.isEmpty()) {
            return new ArrayList<>(); // Return an empty list if there are no assistants
        }

        // Collection reference for assistants
        CollectionReference assistantRef = firestore.collection("assistants");
        List<String> assistantEmails = new ArrayList<>();

        // Fetch each assistant's email by ID
        for (String assistantId : assistantIds) {
            DocumentReference assistantDocRef = assistantRef.document(assistantId);
            ApiFuture<DocumentSnapshot> assistantFuture = assistantDocRef.get();
            DocumentSnapshot assistantDocument = assistantFuture.get();

            if (!assistantDocument.exists()) {
                throw new IllegalArgumentException("Utilizatorul nu există în colectia assistants!");
            }

            // Extract the email field and add it to the list
            String assistantEmail = assistantDocument.getString("email");
            if (assistantEmail != null) {
                assistantEmails.add(assistantEmail);
            }
        }

        return assistantEmails;
    }

    public void saveFcmToken(String userId, String fcmToken) {
        // Referințe către documentele din colecții
        DocumentReference userRef = firestore.collection("users").document(userId);
        DocumentReference assistantRef = firestore.collection("assistants").document(userId);

        try {
            // Verificăm dacă documentul există în colecția "users"
            if (userRef.get().get().exists()) {
                // Actualizăm documentul utilizatorului cu noul FCM token
                userRef.update("fcmToken", fcmToken);
                System.out.println("FCM token salvat pentru utilizator.");
            }
            // Verificăm dacă documentul există în colecția "assistants"
            else if (assistantRef.get().get().exists()) {
                // Actualizăm documentul asistentului cu noul FCM token
                assistantRef.update("fcmToken", fcmToken);
                System.out.println("FCM token salvat pentru asistent.");
            }
            // Dacă documentul nu există în nicio colecție
            else {
                throw new IllegalArgumentException("ID-ul furnizat nu aparține nici unui utilizator, nici unui asistent!");
            }
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Eroare la salvarea FCM token-ului: " + e.getMessage(), e);
        }
    }

    public void deleteFcmToken(String userId) {
        // Referințe către documentele din colecții
        System.out.println("User ID: " + userId);
        DocumentReference userRef = firestore.collection("users").document(userId);
        DocumentReference assistantRef = firestore.collection("assistants").document(userId);

        try {
            // Verificăm dacă documentul există în colecția "users"
            if (userRef.get().get().exists()) {
                // Ștergem câmpul FCM token din documentul utilizatorului
                userRef.update("fcmToken", FieldValue.delete());
                System.out.println("FCM token șters pentru utilizator.");
            }
            // Verificăm dacă documentul există în colecția "assistants"
            else if (assistantRef.get().get().exists()) {
                // Ștergem câmpul FCM token din documentul asistentului
                assistantRef.update("fcmToken", FieldValue.delete());
                System.out.println("FCM token șters pentru asistent.");
            }
            // Dacă documentul nu există în nicio colecție
            else {
                throw new IllegalArgumentException("ID-ul furnizat nu aparține nici unui utilizator, nici unui asistent!");
            }
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Eroare la ștergerea FCM token-ului: " + e.getMessage(), e);
        }
    }


}
