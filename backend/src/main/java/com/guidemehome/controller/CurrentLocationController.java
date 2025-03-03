package com.guidemehome.controller;

import com.guidemehome.configuration.PublicEndpoint;
import com.guidemehome.dto.LocationDto;
import com.guidemehome.service.CurrentLocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/current-location")
public class CurrentLocationController {

    @Autowired
    private CurrentLocationService currentLocationService;

    @PublicEndpoint
    @PostMapping
    public ResponseEntity<String> updateLocation(@RequestBody LocationDto locationDto) {
        try {
            currentLocationService.updateCurrentLocation(locationDto.getUserId(), locationDto.getLatitude(), locationDto.getLongitude(), locationDto.getTimestamp());
            return ResponseEntity.ok("Locația a fost actualizată cu succes!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
