package com.guidemehome.service;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.guidemehome.client.FirebaseAuthClient;
import com.guidemehome.configuration.FirebaseConfigurationProperties;
import com.guidemehome.dto.FirebaseSignInRequestDto;
import com.guidemehome.dto.FirebaseSignInResponseDto;
import com.guidemehome.dto.TokenSuccessResponseDto;
import com.guidemehome.dto.UserLoginRequestDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class FirebaseAuthClientTest {

    @Mock
    private Firestore firestore;

    @Mock
    private FirebaseAuth firebaseAuth;

    @Mock
    private FirebaseConfigurationProperties firebaseConfigurationProperties;

    @InjectMocks
    private FirebaseAuthClient firebaseAuthClient;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testLogin_Success() throws FirebaseAuthException, ExecutionException, InterruptedException {
        // Arrange
        UserLoginRequestDto userLoginRequest = new UserLoginRequestDto();
        userLoginRequest.setEmail("test@example.com");
        userLoginRequest.setPassword("password123");

        UserRecord userRecord = mock(UserRecord.class);
        when(userRecord.getUid()).thenReturn("mockUuid");

        DocumentSnapshot documentSnapshot = mock(DocumentSnapshot.class);
        when(documentSnapshot.exists()).thenReturn(true);
        when(documentSnapshot.contains("role")).thenReturn(true);
        when(documentSnapshot.getString("role")).thenReturn("USER");

        when(firebaseAuth.getUserByEmail(anyString())).thenReturn(userRecord);
        when(firestore.collection(anyString()).document(anyString()).get().get()).thenReturn(documentSnapshot);

        // Act
        TokenSuccessResponseDto response = firebaseAuthClient.login(userLoginRequest);

        // Assert
        assertNotNull(response);
        assertEquals("mockIdToken", response.getAccessToken());
        assertEquals("USER", response.getRole());
    }

    @Test
    void testLogin_InvalidCredentials() throws FirebaseAuthException {
        // Arrange
        UserLoginRequestDto userLoginRequest = new UserLoginRequestDto();
        userLoginRequest.setEmail("invalid@example.com");
        userLoginRequest.setPassword("wrongPassword");

        when(firebaseAuth.getUserByEmail(anyString())).thenThrow(FirebaseAuthException.class);

        // Act & Assert
        assertThrows(FirebaseAuthException.class, () -> firebaseAuthClient.login(userLoginRequest));
    }

    @Test
    void testFetchUserRole_NoRoleField() throws ExecutionException, InterruptedException {
        // Arrange
        String mockUuid = "mockUuid";
        DocumentSnapshot documentSnapshot = mock(DocumentSnapshot.class);
        when(documentSnapshot.exists()).thenReturn(true);
        when(documentSnapshot.contains("role")).thenReturn(false);
        when(firestore.collection(anyString()).document(anyString()).get().get()).thenReturn(documentSnapshot);

        // Act & Assert
        //RuntimeException exception = assertThrows(RuntimeException.class, () -> firebaseAuthClient.fetchUserRole(mockUuid));
        //assertEquals("No user found for the provided uuid.", exception.getMessage());
    }

    @Test
    void testFetchUserRole_ExceptionThrown() {
        // Arrange
        String mockUuid = "mockUuid";
        when(firestore.collection(anyString()).document(anyString()).get()).thenThrow(new RuntimeException("Firestore error"));

        // Act & Assert
        //RuntimeException exception = assertThrows(RuntimeException.class, () -> firebaseAuthClient.fetchUserRole(mockUuid));
        //assertEquals("Failed to fetch user role", exception.getMessage());
    }
}
