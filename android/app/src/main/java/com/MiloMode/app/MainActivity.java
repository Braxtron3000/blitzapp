package com.milomode.app;

import android.content.pm.ApplicationInfo;
import android.net.http.SslError;
import android.os.Bundle;
import android.webkit.SslErrorHandler;
import android.webkit.WebView;

import com.milomode.app.BuildConfig;
import com.milomode.app.GoogleAuthPlugin;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();
        if (BuildConfig.DEBUG) {
            this.bridge.getWebView().setWebViewClient(new BridgeWebViewClient(this.bridge) {
                @Override
                public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
//                    super.onReceivedSslError(view, handler, error);
                    handler.proceed();
                }
            });

        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
//        registerPlugin(GoogleAuthPlugin.class);
        registerPlugin(AuthenticatorPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
