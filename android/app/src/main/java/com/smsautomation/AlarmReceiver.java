package com.smsautomation;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.provider.Telephony;
import android.telephony.SmsManager;
import java.util.Calendar;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.Arguments;

public class AlarmReceiver extends BroadcastReceiver {

    private void sendEvent(ReactContext reactContext,
    String eventName,
    WritableMap params) {
    reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit(eventName, params);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        String phoneNumber = intent.getStringExtra("phoneNumber");
        String msg = intent.getStringExtra("msg");
        String repeat = intent.getStringExtra("repeat");
        String[] phoneArr = phoneNumber.split("; ");
        int alarmID = intent.getIntExtra("alarmID", -1);

        int currentDayOfWeek = Calendar.getInstance().get(Calendar.DAY_OF_WEEK);

        SmsManager smgr = SmsManager.getDefault();
        if(repeat.equals("null")) {
            for (int i = 0; i < phoneArr.length; i++) {
                smgr.sendTextMessage(phoneArr[i], null, msg, null, null);
            }
        }
        else {
            if(!repeat.equals("")) {
                String[] repeatArr = repeat.split("; ");
                boolean currentDayInRepeat = false;
                for (int j = 0; j < repeatArr.length; j++) {
                    System.out.println("This works");
                    if (repeatArr[j] == "") continue;
                    if (Integer.valueOf(repeatArr[j]) == currentDayOfWeek)
                    {
                        currentDayInRepeat = true;
                        break;
                    }
                }
                if (currentDayInRepeat == true) {
                    for (int i = 0; i < phoneArr.length; i++) {
                        smgr.sendTextMessage(phoneArr[i], null, msg, null, null);
                    }
                }
            }
        }
    }
}