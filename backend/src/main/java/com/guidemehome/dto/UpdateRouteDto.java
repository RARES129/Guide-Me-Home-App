package com.guidemehome.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRouteDto {

    private String userId;
    private String routeId;
    private String name;
    private List<Waypoint> waypoints;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Waypoint {
        private double lng;
        private double lat;
    }
}

