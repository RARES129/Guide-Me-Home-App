package com.guidemehome.controller;

import com.guidemehome.configuration.PublicEndpoint;
import com.guidemehome.dto.AlertRequestDto;
import com.guidemehome.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/alert")
public class AlertController {


    @Autowired
    private AlertService alertService;

    @PublicEndpoint
    @PostMapping()
    public ResponseEntity<String> alert(@RequestBody AlertRequestDto alertDto) {
        try {
           alertService.sendAlertToAssistants (alertDto.getSenderId() ,alertDto.getReason());
           alertService.sendPushNotificationToAssistants(alertDto.getSenderId(), alertDto.getReason());
           return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }
}