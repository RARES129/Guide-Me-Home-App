package com.guidemehome.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private Firestore firestore;

    @Autowired
    private FirebaseAuth firebaseAuth;

    public void sendInvitation(String senderEmail, String recipientEmail, String tokenUrl) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipientEmail);
        message.setSubject("Invitație GuideMeHome");
        message.setText("Salut! " + senderEmail + " ți-a trimis o invitație pentru a fi contact de urgenta. "
                + "Apasă pe link-ul de mai jos pentru a accepta invitația:\n\n"
                + tokenUrl + "\n\n"
                + "Această invitație expiră în 48 de ore.");
        mailSender.send(message);
    }



}
