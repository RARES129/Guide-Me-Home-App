package com.guidemehome.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvitationDto {
    private String senderId;
    private String recipientEmail;
    private String defaultBackendApiUrl;
}
