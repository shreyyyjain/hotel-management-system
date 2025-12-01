package com.shrey.hotel.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(System.getenv().getOrDefault("SMTP_HOST", "localhost"));
        mailSender.setPort(Integer.parseInt(System.getenv().getOrDefault("SMTP_PORT", "1025"))); // MailHog dev
        mailSender.setUsername(System.getenv().getOrDefault("SMTP_USER", ""));
        mailSender.setPassword(System.getenv().getOrDefault("SMTP_PASS", ""));

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "false");
        props.put("mail.smtp.starttls.enable", "false");
        props.put("mail.debug", "true");
        return mailSender;
    }
}
