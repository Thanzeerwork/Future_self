import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const MonacoEditor = ({
    value,
    language = 'javascript',
    theme = 'vs',
    onChange,
    style
}) => {
    const webViewRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Map common language names to Monaco supported languages
    const getMonacoLanguage = (lang) => {
        const map = {
            'js': 'javascript',
            'py': 'python',
            'python': 'python',
            'javascript': 'javascript',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'csharp': 'csharp'
        };
        return map[lang.toLowerCase()] || 'javascript';
    };

    const monacoLanguage = getMonacoLanguage(language);

    const initialValueRef = useRef(value);

    const htmlContent = React.useMemo(() => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        html, body { height: 100%; margin: 0; padding: 0; overflow: hidden; background-color: #ffffff; }
        #container { height: 100%; width: 100%; }
    </style>
</head>
<body>
    <div id="container"></div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js"></script>
    <script>
        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
        
        require(['vs/editor/editor.main'], function() {
            var editor = monaco.editor.create(document.getElementById('container'), {
                value: ${JSON.stringify(initialValueRef.current)},
                language: '${monacoLanguage}',
                theme: '${theme}',
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                wrappingIndent: 'indent',
                lineNumbers: 'on',
                renderWhitespace: 'none',
                fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            });

            // Handle messages from React Native
            document.addEventListener('message', function(event) {
                handleMessage(event.data);
            });
            
            window.addEventListener('message', function(event) {
                handleMessage(event.data);
            });

            function handleMessage(data) {
                try {
                    var parsed = JSON.parse(data);
                    if (parsed.type === 'setValue') {
                        var position = editor.getPosition();
                        var currentValue = editor.getValue();
                        if (currentValue !== parsed.value) {
                            editor.setValue(parsed.value);
                            editor.setPosition(position);
                        }
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }

            // Send changes to React Native
            editor.onDidChangeModelContent(function() {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'onChange',
                        value: editor.getValue()
                    }));
                }
            });
            
            // Signal that editor is ready
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'onReady'
                }));
            }
        });
    </script>
</body>
</html>
  `, [monacoLanguage, theme]); // Re-create HTML only if language or theme changes

    const lastEmittedValue = useRef(value);

    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'onChange' && onChange) {
                lastEmittedValue.current = data.value;
                onChange(data.value);
            } else if (data.type === 'onReady') {
                setIsLoaded(true);
            }
        } catch (error) {
            console.error('Error parsing WebView message:', error);
        }
    };

    // Update editor content when value prop changes externally
    useEffect(() => {
        if (isLoaded && webViewRef.current && value !== lastEmittedValue.current) {
            webViewRef.current.postMessage(JSON.stringify({
                type: 'setValue',
                value: value
            }));
        }
    }, [value, isLoaded]);

    return (
        <View style={[styles.container, style]}>
            <WebView
                ref={webViewRef}
                source={{ html: htmlContent }}
                onMessage={handleMessage}
                style={styles.webview}
                scrollEnabled={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                originWhitelist={['*']}
            />
            {!isLoaded && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        borderRadius: 8,
    },
    webview: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MonacoEditor;
