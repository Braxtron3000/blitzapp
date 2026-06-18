package com.milomode.app

import android.content.Context
import android.util.Log
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.credentials.PasswordCredential
import androidx.credentials.PublicKeyCredential
import androidx.credentials.exceptions.GetCredentialException
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import kotlinx.coroutines.coroutineScope
import androidx.credentials.CredentialManager
import androidx.datastore.core.DataStore
import androidx.datastore.core.Serializer
import androidx.datastore.dataStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.count
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import java.io.InputStream
import java.io.OutputStream

@Serializable
data class Settings(
    val exampleCounter: Int,
    val email: String?,
    val token: String?,
    val name: String?,
    val image: String?
)

object SettingsSerializer : Serializer<Settings> {

    override val defaultValue: Settings =
        Settings(exampleCounter = 0, email = "", token = "", name = "", image = "")

    override suspend fun readFrom(input: InputStream): Settings {
        try {
            // Check if the input stream is available to read
            if (input.available() == 0) {
                return defaultValue
            }

            return Json.decodeFromString<Settings>(
                input.readBytes().decodeToString()
            )
        } catch (e: SerializationException) {
            // If the JSON is corrupted, return default settings
            return defaultValue
        }
    }

    override suspend fun writeTo(t: Settings, output: OutputStream) {
        output.write(
            Json.encodeToString(t).encodeToByteArray()
        )
    }
}

val Context.datastore: DataStore<Settings> by dataStore(
    fileName = "settings.json",
    serializer = SettingsSerializer,
)


@CapacitorPlugin(name = "Authenticator")
class AuthenticatorPlugin : Plugin() {
    private val implementation = Authenticator()
    private val TAG = "joemama"

    suspend fun writeCredentials(settings1: Settings) {
        try {
            Log.v(TAG, "writing settings")
            context.datastore.updateData { settings ->
                settings.copy(
                    email = settings1.email,
                    token = settings1.token,
                    name = settings1.name,
                    image = settings1.image
                )
            }
            Log.v(TAG, "settings written")
        } catch (e: Exception) {
            Log.e(TAG, "Error writing settings", e)
        }
    }



    private fun instantiateSignin(serverClientId: String): GetGoogleIdOption? {
        var googleIdOption: GetGoogleIdOption? = null;
        try {
            Log.v(TAG, "AAAYYY HERE I AM");
            googleIdOption = GetGoogleIdOption.Builder().setFilterByAuthorizedAccounts(false)
                .setServerClientId(serverClientId)
                .setAutoSelectEnabled(true)
                // nonce string to use when generating a Google ID token
                .setNonce("YOURMOM")//FIXME: ALSO DONT COMMIT ME
                .build()

            Log.v(TAG, "AAAYYY HERE I GO " + googleIdOption.toString());

        } catch (e: Exception) {
            Log.e(TAG, "AAAYYY BINGBONG SOMETHING STUPID HAPPENED ");

            e.printStackTrace()
        }
        return googleIdOption;
    }

    private suspend fun handleSignIn(result: GetCredentialResponse): JSObject? {
        // Handle the successfully returned credential.
        val credential = result.credential
        val responseJson: String

        when (credential) {

            // Passkey credential
            is PublicKeyCredential -> {
                // Share responseJson such as a GetCredentialResponse to your server to validate and
                // authenticate
                responseJson = credential.authenticationResponseJson
            }

            // Password credential
            is PasswordCredential -> {
                // Send ID and password to your server to validate and authenticate.
                val username = credential.id
                val password = credential.password
            }

            // GoogleIdToken credential
            is CustomCredential -> {
                if (credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                    try {
                        // Use googleIdTokenCredential and extract the ID to validate and
                        // authenticate on your server.
                        val googleIdTokenCredential =
                            GoogleIdTokenCredential.createFrom(credential.data)

                        Log.v(
                            TAG,
                            googleIdTokenCredential.displayName + " | " + googleIdTokenCredential.id + " | " + googleIdTokenCredential.profilePictureUri
                        );


                        val jsObject = JSObject();
                        //extra idk where
                        val email = googleIdTokenCredential.id
                        val token = googleIdTokenCredential.idToken
                        val name = googleIdTokenCredential.displayName
                        val image = googleIdTokenCredential.profilePictureUri.toString()

                        //user
                        jsObject.put("email", googleIdTokenCredential.id)
                        jsObject.put("token", googleIdTokenCredential.idToken)
                        jsObject.put("name", googleIdTokenCredential.displayName)
                        jsObject.put("image", googleIdTokenCredential.profilePictureUri.toString())

//                        CoroutineScope(Dispatchers.IO).launch {

                        try {
                            Log.v(TAG, "incrementing counter")
                            Log.v(TAG,"email "+email);
                            Log.v(TAG,"token "+token);
                            Log.v(TAG,"name "+name);

                            val settings = Settings(0, email, token, name, image)
                            Log.v(TAG,"set email "+settings.email);
                            Log.v(TAG,"set token "+settings.token);
                            Log.v(TAG,"set name "+settings.name);
                            writeCredentials(settings)
                            Log.v(TAG, "counter incremented")
                        } catch (e: Exception) {
                            Log.e(TAG, "Error incrementing counter", e)
                        }

//                        }


                        //account
                        jsObject.put(
                            "providerAccountId", googleIdTokenCredential.idToken
                        )//! not sure
                        jsObject.put("type", googleIdTokenCredential.type)

                        return jsObject;
                        // You can use the members of googleIdTokenCredential directly for UX
                        // purposes, but don't use them to store or control access to user
                        // data. For that you first need to validate the token:
                        // pass googleIdTokenCredential.getIdToken() to the backend server.
                        // see [validation instructions](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)
                    } catch (e: GoogleIdTokenParsingException) {
                        Log.e(TAG, "Received an invalid google id token response", e)
                    }
                } else {
                    // Catch any unrecognized custom credential type here.
                    Log.e(TAG, "Unexpected type of credential")
                }
            }

            else -> {
                // Catch any unrecognized credential type here.
                Log.e(TAG, "Unexpected type of credential")
            }
        }
        return null;
    }


    private suspend fun createSignInGoogleFlow(serverClientId: String): JSObject? {
        val credentialManager = CredentialManager.create(context)
        Log.v(TAG, "calling create Sign in google flow")
        val googleIdOption = instantiateSignin(serverClientId);
        var returnObj: JSObject? = null;

        if (googleIdOption == null) {
            Log.v(TAG, "googleIdOption is null")
        } else {
            val request: GetCredentialRequest =
                GetCredentialRequest.Builder().addCredentialOption(googleIdOption).build()

            Log.v(TAG, "got request ")
            coroutineScope {
                try {
                    val result = credentialManager.getCredential(
                        request = request,
                        context = context,//what is the lifecycle of this request? whole app or is it being reinvented each time?
                    )
                    returnObj = handleSignIn(result) //Todo: why is it not just returning here?
                } catch (e: GetCredentialException) {
                    // Handle failure
                    Log.e(TAG, "getCredential failed", e)
                }
            }
        }

        Log.v(TAG, "FINISHED create Sign in google flow!")
        return returnObj;
    }


    @PluginMethod
    fun readSettings(call: PluginCall) {//Todo: change to readCredentials and move up
        val ret = JSObject()
        Log.v(TAG, "read settings")

        try {
            Log.v(TAG, "read Credentials")
            val pluginScope = CoroutineScope(Dispatchers.Main)
            pluginScope.launch {
                try {

                    Log.v(TAG, "RRRRAAAAHHHH")

                    val settings = context.datastore.data.first();
                    ret.put("email", settings.email)
                    ret.put("token", settings.token)
                    ret.put("name", settings.name)
                    ret.put("image", settings.image)
                    Log.v(TAG, "settings read")
                    call.resolve(ret);
                }catch (e: Exception){
                    Log.e(TAG, "Error reading settings within coroutine", e)
                    call.reject("An error occurred while reading settings", e);
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error reading settings ", e)
            call.reject("An error occurred in readsettings", e);
        }
    }

    @PluginMethod
    fun hello(call: PluginCall) {
        Log.v("joe mama", "AAAYYY calling hello");
        var returncredentials: JSObject? = null
        val pluginScope = CoroutineScope(Dispatchers.Main)
//        val serverClientId = call.getString("value");
//        if(serverClientId==null){
//            call.reject("serverClientId is null")
//            return;
//        }


        pluginScope.launch {
            try {
                // Wait for the sign-in flow to finish and return the JSObject
                val data = createSignInGoogleFlow("uh oh retard alert");

                // Send the data back to JavaScript
                call.resolve(data)

            } catch (e: androidx.credentials.exceptions.GetCredentialException) {
                // Handle user cancellation or no credentials found
                Log.e(TAG, "getCredential failed", e)
                call.reject("Sign-in failed or cancelled", e)
            } catch (e: Exception) {
                // Handle other errors
                Log.e(TAG, "An error occurred", e)
                call.reject("An error occurred", e)
            }
        }

    }
}
