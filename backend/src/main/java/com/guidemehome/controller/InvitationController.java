package com.guidemehome.controller;

import com.guidemehome.configuration.PublicEndpoint;
import com.guidemehome.dto.InvitationDto;
import com.guidemehome.service.InvitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/invitation")
public class InvitationController {
    @Autowired
    private InvitationService invitationService;

    @PublicEndpoint
    @PostMapping
    public ResponseEntity<String> sendInvitation(@RequestBody InvitationDto invitationDto) {
        try {
            invitationService.sendInvitationRequest(invitationDto.getSenderId(), invitationDto.getRecipientEmail(), invitationDto.getDefaultBackendApiUrl());
            return ResponseEntity.ok("Invitație trimisă!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PublicEndpoint
    @GetMapping(value = "/accept", produces = "text/html")
    public ResponseEntity<String> acceptInvitation(@RequestParam String token) {
        String htmlResponse;
        try {
            String message = invitationService.acceptInvitationRequest(token);
            htmlResponse = generateHtmlPage(message);
            return ResponseEntity.ok().body(htmlResponse);
        } catch (Exception e) {
            htmlResponse = generateHtmlPage("Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(htmlResponse);
        }
    }

    // Utility method to generate a simple HTML page
    private String generateHtmlPage(String message) {
        return "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "    <meta charset=\"UTF-8\">" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "    <title>Invitation Status</title>" +
                "    <style>" +
                "        body {" +
                "            background-color: #f4f4f4;" +
                "            display: flex;" +
                "            flex-direction: column;" +
                "            align-items: center;" +
                "            justify-content: center;" +
                "            height: 100vh;" +
                "            margin: 0;" +
                "            font-family: Arial, sans-serif;" +
                "        }" +
                "        .message-box {" +
                "            background: #fff;" +
                "            padding: 2rem;" +
                "            border-radius: 8px;" +
                "            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);" +
                "            text-align: center;" +
                "        }" +
                "        h1 {" +
                "            color: #333;" +
                "            font-size: 2em;" +
                "            margin: 0;" +
                "        }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class=\"message-box\">" +
                "        <h1>" + message + "</h1>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }
}
