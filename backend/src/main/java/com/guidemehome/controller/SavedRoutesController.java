package com.guidemehome.controller;

import com.guidemehome.configuration.PublicEndpoint;
import com.guidemehome.dto.SavedRoutesDto;
import com.guidemehome.dto.UpdateRouteDto;
import com.guidemehome.service.SavedRoutesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/route")
public class SavedRoutesController {
    @Autowired
    private SavedRoutesService savedRoutesService;

    @PublicEndpoint
    @PostMapping
    public ResponseEntity<String> saveRoute(@RequestBody SavedRoutesDto savedRoutesDto) {
        try {
            savedRoutesService.saveRoute(savedRoutesDto.getUserId(), savedRoutesDto.getName(), savedRoutesDto.getWaypoints());
            return ResponseEntity.ok("Ruta salvată!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PublicEndpoint
    @PutMapping
    public ResponseEntity<Map<String, Object>> updateRoute(@RequestBody UpdateRouteDto updateRouteDto) {
        try {
            System.out.println("UpdateRouteDto: " + updateRouteDto);
            Map<String, Object> savedRoute = savedRoutesService.updateRoute(updateRouteDto);
            return ResponseEntity.ok(savedRoute);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PublicEndpoint
    @GetMapping("/retrieveRouteList")
    public ResponseEntity<List<Map<String, Object>>> retrieveRouteList(@RequestParam String userId) {
        try {
            List<Map<String, Object>> savedRoutes = savedRoutesService.retrieveRouteList(userId);
            return ResponseEntity.ok(savedRoutes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();

        }
    }

    @PublicEndpoint
    @DeleteMapping("/deleteRoute")
    public ResponseEntity<String> deleteRoute(@RequestParam String userId, @RequestParam String routeId) {
        try {
            savedRoutesService.deleteRoute(userId, routeId);
            return ResponseEntity.ok("Ruta a fost ștearsă!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
