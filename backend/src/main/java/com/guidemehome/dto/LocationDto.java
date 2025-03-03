package com.guidemehome.dto;

import lombok.Data;

@Data
public class LocationDto {
    private String userId;
    private Double latitude;
    private Double longitude;
    private Long timestamp;
}
