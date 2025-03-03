package com.guidemehome.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
public class CurrentLocationService {

    @Autowired
    private Firestore firestore;

    public void updateCurrentLocation(String userId, Double latitude, Double longitude, Long timestamp) throws ExecutionException, InterruptedException {
        // Referința către documentul utilizatorului din Firestore
        DocumentReference userRef = firestore.collection("users").document(userId);

        // Verifică dacă documentul există
        ApiFuture<DocumentSnapshot> future = userRef.get();
        DocumentSnapshot document = future.get();

        if (!document.exists()) {
            throw new IllegalArgumentException("Utilizatorul nu există în Firestore!");
        }

        // Creează un obiect pentru locație
        Map<String, Object> locationData = new HashMap<>();
        locationData.put("latitude", latitude);
        locationData.put("longitude", longitude);
        locationData.put("timestamp", timestamp);

        // Actualizează câmpul `currentLocation`
        userRef.update("currentLocation", locationData);
    }
}
