package com.guidemehome.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.guidemehome.controller.UserController;
import com.guidemehome.dto.TokenSuccessResponseDto;
import com.guidemehome.dto.UserCreationRequestDto;
import com.guidemehome.dto.UserLoginRequestDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
        Mockito.reset(userService);  // Reset mocks to avoid any side effects between tests
    }


    @Test
    void testCreateUser_Success() throws Exception {
        UserCreationRequestDto userCreationRequest = new UserCreationRequestDto ();
        userCreationRequest.setEmail("test@example.com");
        userCreationRequest.setPassword("password123");
        userCreationRequest.setRole("user");

        mockMvc.perform(post("/api/v1/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userCreationRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void testLogin_Success() throws Exception {
        UserLoginRequestDto userLoginRequest = new UserLoginRequestDto();
        userLoginRequest.setEmail("test@example.com");
        userLoginRequest.setPassword("password123");

        TokenSuccessResponseDto tokenSuccessResponseDto = TokenSuccessResponseDto.builder()
                .accessToken("fake-token")
                .role("user")
                .build();

        when(userService.login(any(UserLoginRequestDto.class))).thenReturn(tokenSuccessResponseDto);

        mockMvc.perform(post("/api/v1/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userLoginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("fake-token"))
                .andExpect(jsonPath("$.role").value("user"));
    }


}
