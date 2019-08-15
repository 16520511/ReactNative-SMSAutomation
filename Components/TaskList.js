/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {StyleSheet, View, PermissionsAndroid, NativeModules, ScrollView} from 'react-native';
import { List, Text, Icon, Appbar, IconButton } from 'react-native-paper'
import { createStackNavigator, createAppContainer } from "react-navigation";
import EditTask from './EditTask'

const SMS = NativeModules.ScheduledSMS;

class TaskList extends Component {
    constructor(props) {
        super(props);
        this.state = {
          tasks: []
        }
    }

    static navigationOptions = {
      header: null,
    };

    _loadTasks = () => {
      this.setState({tasks: []})
      db.transaction((tx) => {
        tx.executeSql('SELECT * FROM SMSTask WHERE completed = (?)',
        ["false"], (tx, rs) => {
          var len = rs.rows.length;
          for (let i = 0; i < len; i++) {
            let row = rs.rows.item(i);
            
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

    async componentDidMount() {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.SEND_SMS
        );
        this._loadTasks();

      } catch (err) {
        console.warn(err);
      }
    }

    _deleteTask = (id, index) => {
      db.transaction((tx) => {
        tx.executeSql('DELETE FROM SMSTask WHERE id=(?)',
        [id], (tx, rs) => {
          tasksAfterDelete = this.state.tasks;
          tasksAfterDelete.splice(index, 1);
          this.setState({tasks: tasksAfterDelete});
        });
      }, (tx, err) => console.log(err));
      SMS.cancel(id);
      SMS.cancel(id+9999);
    }

    render() {
      const taskList = this.state.tasks.map((task, index) => {
        const description = "Send to: " + task.contact
        return <View><List.Item
          title={task.title}
          description={task.msg}
          left={props => <List.Icon {...props} icon={task.icon} color={task.iconColor} />}
          right={props => <View style={{flexDirection: 'row'}}><IconButton animated={true} onPress={() => this._deleteTask(task.id, index)} icon='delete' color='red' />
          <IconButton animated={true} onPress={() => this.props.navigation.navigate('Edit', {id: task.id})} icon='edit' color='orange' /></View>}/>
          <View style={{borderBottomColor: 'gray', marginRight: 10, marginLeft: 10, borderBottomWidth: 0.5,}}/>
          </View>
      })
      return (
      <ScrollView>
        <Appbar.Header style={styles.appbar}>
          <Appbar.Content
            title="Your Tasks" color="white"
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

const AppNavigator = createStackNavigator({
  List: TaskList,
  Edit: {
    screen: EditTask
  }
});

export default createAppContainer(AppNavigator);