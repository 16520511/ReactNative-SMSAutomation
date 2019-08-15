/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {StyleSheet, View, PermissionsAndroid, NativeModules, ScrollView} from 'react-native';
import { List, Text, Icon, Appbar, } from 'react-native-paper'

export default class CompletedTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
          tasks: []
        }
    }

    _loadTasks = () => {
      this.setState({tasks: []})
      db.transaction((tx) => {
        tx.executeSql('SELECT * FROM SMSTask WHERE completed = (?)',
        ["true"], (tx, rs) => {
          var len = rs.rows.length;
          for (let i = 0; i < len; i++) {
            let row = rs.rows.item(i);
            console.log(row.id);
            // if ((row.mode == 'datetime') || (row.repeat == "" && row.mode == "time")) {
            //   console.log(row.time);
            //   let date = row.time.split(" / ")[0];
            //   let time = row.time.split(" / ")[1];
            //   let set = date + "T" + time;
            //   let setDate = new Date(set);
            //   console.log(setDate);
              // if(setDate > new Date()) {
                let task = [{ title: row.title, time: row.time, icon: row.mode == "datetime" ? 'sms' : 'repeat', 
                iconColor: row.mode == "datetime" ? '#008e76' : '#ff9100', contact: row.contact, msg: row.msg, id: row.id }]
                this.setState({tasks: [...this.state.tasks,...task]})
              // }
            // }
            // else {
            //   let task = [{ title: row.title, time: row.time, icon: row.mode == "datetime" ? 'sms' : 'repeat', 
            //   iconColor: row.mode == "datetime" ? '#008e76' : '#ff9100', contact: row.contact, msg: row.msg, id: row.id }]
            //   this.setState({tasks: [...this.state.tasks,...task]})
            // }
          }
        });
      }, (tx, err) => console.log(err));
    }

    componentDidMount() {
        this._loadTasks();
    }
    render() {
      const taskList = this.state.tasks.map(task => {
        const description = "Send to: " + task.contact
        return <List.Item
          title={task.title}
          description={task.msg}
          left={props => <List.Icon {...props} icon={task.icon} color={task.iconColor} />}/>
      })
      return (
      <ScrollView>
        <Appbar.Header style={styles.appbar}>
          <Appbar.Content
            title="Completed Tasks" color="white"
          />
          <Appbar.Action icon="refresh" color="white" onPress={this._loadTasks} />
        </Appbar.Header>
        {taskList}
      </ScrollView>
      );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  appbar: {
    backgroundColor:"#00bfa5",
  }
});
