package com.guidemehome.controller;

import com.guidemehome.configuration.PublicEndpoint;
import com.guidemehome.service.LiveTrackingLocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/live-tracking")
public class LiveTrackingLocationController {

    @Autowired
    private LiveTrackingLocationService liveTrackingLocationService;

    @GetMapping("/{assistantId}")
    @PublicEndpoint
    public ResponseEntity<Map<String, Object>> getLiveLocation(@PathVariable("assistantId") String assistantId) {
        try {
            Map<String, Object> location = liveTrackingLocationService.getAssistedUserLocation(assistantId);
            return ResponseEntity.ok(location);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
