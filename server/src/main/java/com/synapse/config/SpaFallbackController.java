package com.synapse.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaFallbackController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        return "forward:/index.html";
    }

    @RequestMapping(value = {
        "/",
        "/posts/**",
        "/users/**",
        "/search/**",
        "/settings/**",
        "/profile/**",
        "/bookmarks/**",
        "/login",
        "/register"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
