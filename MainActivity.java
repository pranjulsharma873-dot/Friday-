package com.example.fridayai;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Create WebView
        webView = new WebView(this);

        // Set WebView as app screen
        setContentView(webView);

        // WebView settings
        WebSettings settings = webView.getSettings();

        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);

        // Keep links inside WebView
        webView.setWebViewClient(new WebViewClient());

        // Load HTML
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {

        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}

Project structure aise rakhna:

FRIDAY AI
│
├── app
│   └── src
│       └── main
│           │
│           ├── java
│           │   └── com
│           │       └── example
│           │           └── fridayai
│           │               └── MainActivity.java
│           │
│           ├── assets
│           │   ├── index.html
│           │   └── style.css
│           │
│           └── AndroidManifest.xml

Aur "index.html" ke "<head>" me:

<link rel="stylesheet" href="style.css">

Ab hamare paas 3 parts hain:

- "index.html" → FRIDAY AI ka structure/UI
- "style.css" → black theme/design
- "MainActivity.java" → Android app + WebView connection

Next important part AndroidManifest.xml + Gradle hai, jisse ye actual APK me build hoga.