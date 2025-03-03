package com.guidemehome.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
public class AlertService {
    @Autowired
    private final Firestore firestore;
    @Autowired
    private final FirebaseAuth firebaseAuth;
    @Autowired
    private JavaMailSender mailSender;


    public void sendPushNotificationToAssistants(String senderId, String body) {
        try {
            // Obține documentul utilizatorului
            DocumentReference userRef = firestore.collection("users").document(senderId);
            ApiFuture<DocumentSnapshot> userFuture = userRef.get();
            DocumentSnapshot userDoc = userFuture.get();

            if (!userDoc.exists()) {
                throw new IllegalArgumentException("Utilizatorul nu există în colectia users!");
            }

            // Obține lista de ID-uri ale asistenților
            List<String> assistantIds = (List<String>) userDoc.get("assistants");

            if (assistantIds == null || assistantIds.isEmpty()) {
                throw new IllegalArgumentException("Utilizatorul nu are asistenți!");
            }

            // Trimite notificări către fiecare asistent
            for (String assistantId : assistantIds) {
                DocumentReference assistantRef = firestore.collection("assistants").document(assistantId);
                ApiFuture<DocumentSnapshot> assistantFuture = assistantRef.get();
                DocumentSnapshot assistantDoc = assistantFuture.get();

                if (assistantDoc.exists()) {
                    String fcmToken = assistantDoc.getString("fcmToken");
                    if (fcmToken != null && !fcmToken.isEmpty()) {
                        sendNotification(fcmToken, body);
                    } else {
                        System.err.println("Asistentul " + assistantId + " nu are FCM token setat.");
                    }
                } else {
                    System.err.println("Asistentul " + assistantId + " nu există în colectia assistants!");
                }
            }
        } catch (ExecutionException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch assistants data", e);
        }
    }

    private void sendNotification(String fcmToken, String body) {
        try {
            // Construiește și trimite notificarea
            Message message = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle("GUIDE ME HOME")
                            .setBody(body)
                            .build())
//                    .putData("url", "http://localhost:3000/map") // URL-ul pentru acțiunea de click
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("Notification sent successfully: " + response);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send notification", e);
        }
    }

    public void sendAlert(String senderEmail, String recipientEmail, String reason) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipientEmail);
        message.setSubject("GUIDEMEHOME ALERT");
        message.setText("Ai primit o alerta de la utilizatorul "+ senderEmail + "! " + reason);
        mailSender.send(message);
    }

    public void sendAlertToAssistants(String senderId, String reason)
            throws ExecutionException, InterruptedException {

        UserRecord senderRecord;

        try{
            senderRecord = firebaseAuth.getUser(senderId);
        } catch (FirebaseAuthException e) {
            throw new IllegalArgumentException("Utilizatorul cu acest id nu există în Firebase Authentication!");
        }

        String senderEmail = senderRecord.getEmail();
        // Retrieve the user document
        DocumentReference userRef = firestore.collection("users").document(senderId);
        ApiFuture<DocumentSnapshot> userFuture = userRef.get();
        DocumentSnapshot userDoc = userFuture.get();

        if (!userDoc.exists()) {
            throw new IllegalArgumentException("Utilizatorul nu există în colectia users!");
        }

        // Get the array of assistantIds
        List<String> assistantIds = (List<String>) userDoc.get("assistants");

        if (assistantIds == null || assistantIds.isEmpty()) {
            throw new IllegalArgumentException("Utilizatorul nu are asistenți!");
        }

        // Retrieve each assistant's email and send the alert
        for (String assistantId : assistantIds) {
            DocumentReference assistantRef = firestore.collection("assistants").document(assistantId);
            ApiFuture<DocumentSnapshot> assistantFuture = assistantRef.get();
            DocumentSnapshot assistantDoc = assistantFuture.get();

            if (assistantDoc.exists()) {
                String assistantEmail = assistantDoc.getString("email");
                if (assistantEmail != null && !assistantEmail.isEmpty()) {
                    sendAlert(senderEmail,assistantEmail, reason);
                } else {
                    System.err.println("Asistentul " + assistantId + " nu are email setat.");
                }
            } else {
                System.err.println("Asistentul " + assistantId + " nu există în colectia assistants!");
            }
        }
    }
}
