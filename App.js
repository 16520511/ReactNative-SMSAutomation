import * as React from 'react';
import { BottomNavigation, Text } from 'react-native-paper';
import TaskList from './Components/TaskList'
import AddTask from './Components/AddTask'
import CompletedTask from './Components/CompletedTask'
import SQLite from 'react-native-sqlite-storage'
import {NativeModules, DeviceEventEmitter} from 'react-native'


const SMS = NativeModules.ScheduledSMS;

SQLite.DEBUG(true);
global.db = SQLite.openDatabase({name: "SMSAutomationDB.db", location: 'default', createFromLocation: '~www/SMSAutomationDB.db'}, () => {
  console.log('open db successfully');
}, (err) => console.log('error opening db: ' + err));


db.transaction((tx) => {
  // tx.executeSql('DROP TABLE IF EXISTS SMSTask')
  tx.executeSql('CREATE TABLE IF NOT EXISTS SMSTask (id INTEGER PRIMARY KEY,title TEXT NOT NULL,contact TEXT NOT NULL,msg TEXT NOT NULL,mode TEXT NOT NULL, repeat TEXT, time TEXT NOT NULL, completed TEXT NOT NULL)',
  [], (tx, rs) => console.log(rs));
  // tx.executeSql('SELECT * FROM SMSTask',
  // [], (tx, rs) => {
  //   var len = rs.rows.length;
  //   for (let i = 0; i < len; i++) {
  //     let row = rs.rows.item(i);
  //     if (row.mode == 'datetime') {
  //       // console.log(row.time);
  //     //   let date = row.time.split(" / ")[0];
  //     //   let time = row.time.split(" / ")[1];

  //     //   SMS.cancel(row.id);
  //     //   SMS.schedule(row.contact, row.msg, Number(time.split(":")[1]), Number(time.split(":")[0]),
  //     //   Number(date.split("-")[2]), Number(date.split("-")[1]), Number(date.split("-")[0]), row.id);

  //     //   console.log(row.contact, row.msg, Number(time.split(":")[1]), Number(time.split(":")[0]),
  //     //   Number(date.split("-")[2]), Number(date.split("-")[1]), Number(date.split("-")[0]), row.id)
  //     }
  //     else if (row.mode == "time") {
  //       console.log(row.time);
  //     //   // need to check the current day to avoid repeat
  //     //   let date = row.time.split(" / ")[0];
  //     //   let time = row.time.split(" / ")[1];
  //     //   time = time.split(":")
  //     //   SMS.cancel(row.id);
  //     //   SMS.cancel(row.id + 9999);
  //     //   SMS.scheduleRepeat(row.contact, row.msg, Number(time[1]), Number(time[0]), row.repeat, row.id);
  //     }
  //   }
  // });
}, (tx, err) => console.log(err));

db.transaction((tx) => {
  tx.executeSql('SELECT * FROM SMSTask',
  [], (tx, rs) => {
    var len = rs.rows.length;
    for (let i = 0; i < len; i++) {
      let row = rs.rows.item(i);
      if ((row.mode == 'datetime') || (row.repeat == "" && row.mode == "time")) {
        console.log(row.time);
        let date = row.time.split(" / ")[0];
        let time = row.time.split(" / ")[1];
        let set = date + "T" + time;
        let setDate = new Date(set);
        console.log(setDate);
        if(setDate < new Date()) {
          // let task = [{ title: row.title, time: row.time, icon: row.mode == "datetime" ? 'sms' : 'repeat', 
          // iconColor: row.mode == "datetime" ? '#008e76' : '#ff9100', contact: row.contact, msg: row.msg, id: row.id }]
          // this.setState({tasks: [...this.state.tasks,...task]})
          db.transaction((tx) => {
            tx.executeSql('UPDATE SMSTask SET completed = ? WHERE id = ?',
            ["true", row.id], (tx, rs) => {
              console.log("update rs:" + rs);
            });
          }, (tx, err) => console.log(err));
        }
      }
    }
  });
}, (tx, err) => console.log(err));


export default class MyComponent extends React.Component {
  state = {
    index: 0,
    routes: [
      { key: 'tasklist', title: 'Tasks', icon: 'view-list' },
      { key: 'addtask', title: 'New Task', icon: 'playlist-add' },
      { key: 'completed', title: 'Completed', icon: 'history' },
    ],
  };

  _handleIndexChange = index => this.setState({ index });

  _renderScene = BottomNavigation.SceneMap({
    tasklist: TaskList,
    addtask: AddTask,
    completed: CompletedTask,
  });

  render() {
    return (
      <BottomNavigation
        barStyle = {{backgroundColor: '#00bfa5', color: 'white'}}
        navigationState={this.state} activeColor="white" inactiveColor="white"
        onIndexChange={this._handleIndexChange}
        renderScene={this._renderScene}
      />
    );
  }
}