package com.milomode.app;

import android.content.pm.ApplicationInfo;
import android.net.http.SslError;
import android.webkit.SslErrorHandler;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();
        if(BuildConfig.DEBUG){
            this.bridge.getWebView().setWebViewClient(new BridgeWebViewClient(this.bridge){
                @Override
                public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
//                    super.onReceivedSslError(view, handler, error);
                    handler.proceed();
                }
            });

        }
    }
}
