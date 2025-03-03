package com.guidemehome.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
public class LiveTrackingLocationService {

    @Autowired
    private Firestore firestore;

    public Map<String, Object> getAssistedUserLocation(String assistantId) throws ExecutionException, InterruptedException {
        // Referința către documentul assistant din Firestore
        DocumentReference assistantRef = firestore.collection("assistants").document(assistantId);

        // Obține documentul assistant
        ApiFuture<DocumentSnapshot> assistantFuture = assistantRef.get();
        DocumentSnapshot assistantDocument = assistantFuture.get();

        if (!assistantDocument.exists()) {
            throw new IllegalArgumentException("Assistant-ul nu există în Firestore!");
        }

        // Preia ID-ul utilizatorului asistat
        String assistedUserId = assistantDocument.getString("assistedUser");
        if (assistedUserId == null || assistedUserId.isEmpty()) {
            throw new IllegalArgumentException("Nu există un utilizator asistat asociat acestui assistant!");
        }

        // Referința către documentul utilizatorului asistat
        DocumentReference userRef = firestore.collection("users").document(assistedUserId);

        // Obține documentul utilizatorului asistat
        ApiFuture<DocumentSnapshot> userFuture = userRef.get();
        DocumentSnapshot userDocument = userFuture.get();

        if (!userDocument.exists()) {
            throw new IllegalArgumentException("Utilizatorul asistat nu există în Firestore!");
        }

        // Returnează locația curentă
        Map<String, Object> currentLocation = (Map<String, Object>) userDocument.get("currentLocation");
        if (currentLocation == null) {
            throw new IllegalArgumentException("Utilizatorul asistat nu are locația curentă setată!");
        }

        return currentLocation;
    }
}
