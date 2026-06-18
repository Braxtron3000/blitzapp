package com.milomode.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "GoogleAuth")
public class GoogleAuthPlugin extends Plugin {
    @PluginMethod()
    public void echo(PluginCall call) {
//        String value = call.getString("value");
//        JSObject ret = new JSObject();
//        ret.put("value", value);
//        call.resolve(ret);

        //Todo: this is going to cause issues. make authenticatorplugin not a capacitor plugin
        var authplugin = new AuthenticatorPlugin();
        authplugin.hello(call);

    }
}
