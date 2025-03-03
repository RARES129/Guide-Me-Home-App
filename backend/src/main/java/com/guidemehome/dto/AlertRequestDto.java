package com.guidemehome.dto;

import lombok.Getter;
import lombok.Setter;



@Getter
@Setter
public class AlertRequestDto {
    private String senderId;
    private String reason;
}