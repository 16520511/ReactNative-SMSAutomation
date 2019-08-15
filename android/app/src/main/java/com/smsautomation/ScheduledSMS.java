package com.smsautomation;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import android.provider.Telephony;
import android.telephony.SmsManager;

import android.content.pm.PackageManager;
import android.Manifest;
import android.app.AlarmManager;
import android.content.Intent;
import android.content.Context;
import android.app.PendingIntent;
import android.app.Activity;
import android.content.pm.PackageManager;

import java.util.Map;
import java.util.Calendar;
import java.util.HashMap;
import java.lang.System;

public class ScheduledSMS extends ReactContextBaseJavaModule {

  private static final String DURATION_SHORT_KEY = "SHORT";
  private static final String DURATION_LONG_KEY = "LONG";
  public static final int PERMISSION_CODE_SEND_SMS = 123;
  private AlarmManager alarmMgr;

  public ScheduledSMS(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "ScheduledSMS";
  }

  @ReactMethod
  public void schedule(String phoneNumber, String msg, Integer minute, Integer hour, Integer day, Integer month, Integer year, Integer alarmID) {
    Activity currentActivity = getCurrentActivity();

    Calendar calendar = Calendar.getInstance();
    calendar.setTimeInMillis(System.currentTimeMillis());
    calendar.set(Calendar.MILLISECOND, 0);
    calendar.set(Calendar.MINUTE, minute);
    calendar.set(Calendar.HOUR_OF_DAY, hour);
    calendar.set(Calendar.DAY_OF_MONTH, day);
    calendar.set(Calendar.MONTH, month-1);

    alarmMgr = (AlarmManager)getReactApplicationContext().getSystemService(Context.ALARM_SERVICE);

    Intent intent = new Intent(getReactApplicationContext(), AlarmReceiver.class);
    intent.setAction("com.smsautomation.ACTION");
    intent.putExtra("phoneNumber", phoneNumber);
    intent.putExtra("msg", msg);
    String repeat = "null";
    intent.putExtra("repeat", repeat);
    intent.putExtra("alarmID", alarmID);
    PendingIntent alarmIntent = PendingIntent.getBroadcast(getReactApplicationContext(), alarmID, intent, 0);

    alarmMgr.setExact(AlarmManager.RTC, calendar.getTimeInMillis(), alarmIntent);
  }

  @ReactMethod
  public void scheduleRepeat(String phoneNumber, String msg, Integer minute, Integer hour, String repeat, Integer alarmID)
  {
    Activity currentActivity = getCurrentActivity();

    Calendar calendar = Calendar.getInstance();
    calendar.setTimeInMillis(System.currentTimeMillis());
    calendar.set(Calendar.MILLISECOND, 0);
    calendar.set(Calendar.MINUTE, minute);
    calendar.set(Calendar.HOUR_OF_DAY, hour);

    alarmMgr = (AlarmManager)getReactApplicationContext().getSystemService(Context.ALARM_SERVICE);

    Intent intent = new Intent(getReactApplicationContext(), AlarmReceiver.class);
    intent.setAction("com.smsautomation.ACTION");
    intent.putExtra("phoneNumber", phoneNumber);
    intent.putExtra("msg", msg);
    String nullRepeat = "null";
    intent.putExtra("repeat", nullRepeat);
    PendingIntent alarmIntent = PendingIntent.getBroadcast(getReactApplicationContext(), alarmID, intent, 0);
    alarmMgr.setExact(AlarmManager.RTC, calendar.getTimeInMillis(), alarmIntent);

    Intent repeatIntent = new Intent(getReactApplicationContext(), AlarmReceiver.class);
    repeatIntent.setAction("com.smsautomation.ACTION");
    repeatIntent.putExtra("phoneNumber", phoneNumber);
    repeatIntent.putExtra("msg", msg);
    repeatIntent.putExtra("repeat", repeat);
    PendingIntent alarmIntentRepeat = PendingIntent.getBroadcast(getReactApplicationContext(), alarmID+9999, repeatIntent, 0);
    alarmMgr.setInexactRepeating(AlarmManager.RTC, calendar.getTimeInMillis()+86400000, 1000*60*60*24, alarmIntentRepeat);
  }

  @ReactMethod
  public void cancel(Integer alarmID) {
    Intent intent = new Intent(getReactApplicationContext(), AlarmReceiver.class);
    intent.setAction("com.smsautomation.ACTION");
    PendingIntent alarmIntent = PendingIntent.getBroadcast(getReactApplicationContext(), alarmID, intent, 0);
    alarmMgr = (AlarmManager)getReactApplicationContext().getSystemService(Context.ALARM_SERVICE);
    alarmMgr.cancel(alarmIntent);
    if (alarmIntent != null) {
      alarmIntent.cancel();
    }
  }
}