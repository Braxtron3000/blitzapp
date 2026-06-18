package com.milomode.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;

public class Authenticator {

    public String echo(String value) {
        Logger.info("Echo", value);
        return value;
    }

    public JSObject readSettings() {
        var jsobject= new JSObject();
        return jsobject;
    }
    public String hello(String value) {
        Logger.info("Echo", value);
        return value;
    }
}

