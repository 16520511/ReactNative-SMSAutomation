import React, {Component} from 'react';
import {StyleSheet, View, ScrollView, PermissionsAndroid, TextInput, NativeModules, TouchableOpacity, Picker as RNP} from 'react-native';
import { List, Text, IconButton, Colors, Appbar, Checkbox, RadioButton, Button } from 'react-native-paper'
import Contacts from 'react-native-contacts'
import Icon from 'react-native-vector-icons/MaterialIcons';
import Fontawesome from 'react-native-vector-icons/FontAwesome5'
import Picker from 'react-native-picker';
import DatePicker from 'react-native-datepicker'
import AsyncStorage from '@react-native-community/async-storage';

const SMS = NativeModules.ScheduledSMS;

export default class AddTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
          message: '', contact: '', date: '', time: '', contactName: [], 
          contactPhone: [], mode: 'datetime', expanded: false,
          repeat2: false, repeat3: false, repeat4: false, repeat5: false, 
          repeat6: false, repeat7: false, repeat8: false, }
    }

    static navigationOptions = {
      title: 'Home',
      headerStyle: {
        backgroundColor: 'white',
    }}

    async componentDidMount() {
      const today = new Date();
      const minDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + " / " + today.getHours() + ":" + today.getMinutes();
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Contacts.getAll((err, contacts) => {
            if (err) {
              throw err;
            }
            this.setState({contactsData: contacts});
            var contactName = [];
            var contactPhone = []
            for(let i = 0; i<contacts.length; i++) {
              for(let j = 0; j<contacts[i].phoneNumbers.length; j++) {
                contactPhone.push(contacts[i].phoneNumbers[j].number);
                contactName.push(`${contactPhone.length}: ` + contacts[i].givenName);
              }
            }
            this.setState({contactName, contactPhone});
            if(this.state.contactName.length > 0)
              Picker.init({
                pickerData: this.state.contactName,
                pickerTitleText: 'Choose a contact',
                onPickerConfirm: data => {
                  let index = Number(data[0].split(":")[0])-1;
                  if (!this.state.contact.includes('; ' + this.state.contactPhone[index] + ';')
                  && !(this.state.contact.indexOf(this.state.contactPhone[index] + ';') == 0))
                    this.setState({
                      contact: this.state.contact + this.state.contactPhone[index] + '; '
                    })
                },
                onPickerCancel: data => {
                    console.log(data);
                },
                onPickerSelect: data => {
                    console.log(data);
                }
              });
          })

        } else {
            console.warn('wtf');
        }
      } catch (err) {
        console.warn(err);
      }
    }

    rollbackState = () => {
      this.setState = {
        message: '', contact: '', date: '', time: '', contactName: [], 
        contactPhone: [], mode: 'datetime', expanded: true,
        repeat2: false, repeat3: false, repeat4: false, repeat5: false, 
        repeat6: false, repeat7: false, repeat8: false, }
    }

    pickContact = () => {
      Picker.show();
    }

    _handlePress = () =>
    this.setState({
      expanded: !this.state.expanded
    });

    _handleSubmit = async () => {
      if (this.state.mode == "datetime")
      {
        let date = this.state.date.split(" / ")[0];
        let time = this.state.date.split(" / ")[1];

        db.transaction((tx) => {
          tx.executeSql('INSERT INTO SMSTask(title, contact, msg, mode, time, completed) VALUES(?, ?, ?, ?, ?, ?)',
          [this.state.title, this.state.contact, this.state.message, this.state.mode, this.state.date, "false"], (tx, rs) => {
            SMS.cancel(rs.insertId);
            SMS.schedule(this.state.contact, this.state.message, Number(time.split(":")[1]), Number(time.split(":")[0]),
            Number(date.split("-")[2]), Number(date.split("-")[1]), Number(date.split("-")[0]), rs.insertId);
            this.props.jumpTo('tasklist');
          });
        }, (tx, err) => console.log(err));
      }
      else if (this.state.mode == "time") {
        let time = this.state.time.split(":");

        const today = new Date();
        let thisMonth =  String(today.getMonth() + 1).length == 1 ? "0" + String(today.getMonth() + 1) : String(today.getMonth() + 1);
        let thisDate = String(today.getDate()).length == 1 ? "0" + String(today.getDate()) : String(today.getDate());
        let todayFormat = today.getFullYear() + "-" + thisMonth + "-" + thisDate;
        
        let repeat = "";
        if(this.state.repeat2 == true) repeat += "2; ";
        if(this.state.repeat3 == true) repeat += "3; ";
        if(this.state.repeat4 == true) repeat += "4; ";
        if(this.state.repeat5 == true) repeat += "5; ";
        if(this.state.repeat6 == true) repeat += "6; ";
        if(this.state.repeat7 == true) repeat += "7; ";
        if(this.state.repeat8 == true) repeat += "1; ";

        console.log('Repeat is: ' + repeat);

        db.transaction((tx) => {
          tx.executeSql('INSERT INTO SMSTask(title, contact, msg, mode, time, repeat, completed) VALUES(?, ?, ?, ?, ?, ?, ?)',
          [this.state.title, this.state.contact, this.state.message, this.state.mode, todayFormat + ' / ' + this.state.time, repeat, "false"], (tx, rs) => {
            SMS.cancel(rs.insertId);
            SMS.cancel(rs.insertId + 9999);
            SMS.scheduleRepeat(this.state.contact, this.state.message, Number(time[1]), Number(time[0]), repeat, rs.insertId);
            this.props.jumpTo('tasklist');
          });
        }, (tx, err) => console.log(err));
      }
    }
    
    render() {
        const mode = this.state.mode;
        const format = this.state.mode == "datetime" ? "YYYY-MM-DD / HH:mm" : "HH:mm";
        const repeat = this.state.mode == "datetime" ? <View></View> : ( 
          <List.Accordion
            title="Repeat" left={props => <List.Icon {...props} icon="repeat" />} 
            expanded={this.state.expanded} onPress={this._handlePress}>
            <List.Item
            title="Every Monday" description="Item description"
            left={props =><Checkbox style={{flex: 1}} status={this.state.repeat2 ? 'checked' : 'unchecked'} 
            onPress={() => { this.setState({ repeat2: !this.state.repeat2 }); }}/>}/>
            <List.Item
            title="Every Tuesday" description="Item description"
            left={props =><Checkbox style={{flex: 1}} status={this.state.repeat3 ? 'checked' : 'unchecked'} 
            onPress={() => { this.setState({ repeat3: !this.state.repeat3 }); }}/>}/>
            <List.Item
            title="Every Wednesday" description="Item description"
            left={props =><Checkbox style={{flex: 1}} status={this.state.repeat4 ? 'checked' : 'unchecked'} 
            onPress={() => { this.setState({ repeat4: !this.state.repeat4 }); }}/>}/>
            <List.Item
            title="Every Thursday" description="Item description"
            left={props =><Checkbox style={{flex: 1}} status={this.state.repeat5 ? 'checked' : 'unchecked'} 
            onPress={() => { this.setState({ repeat5: !this.state.repeat5 }); }}/>}/>
            <List.Item
            title="Every Friday" description="Item description"
            left={props =><Checkbox style={{flex: 1}} status={this.state.repeat6 ? 'checked' : 'unchecked'} 
            onPress={() => { this.setState({ repeat6: !this.state.repeat6 }); }}/>}/>
            <List.Item
            title="Every Saturday" description="Item description"
            left={props =><Checkbox style={{flex: 1}} status={this.state.repeat7 ? 'checked' : 'unchecked'} 
            onPress={() => { this.setState({ repeat7: !this.state.repeat7 }); }}/>}/>
            <List.Item
            title="Every Sunday" description="Item description"
            left={props =><Checkbox style={{flex: 1}} status={this.state.repeat8 ? 'checked' : 'unchecked'} 
            onPress={() => { this.setState({ repeat8: !this.state.repeat8 }); }}/>}/>
          </List.Accordion>);

        const today = new Date();
        const minDate = this.state.mode == "datetime" ? 
        today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + " / " + today.getHours() + ":" + today.getMinutes() : today.getHours() + ":" + today.getMinutes();
        const datePicker = this.state.mode == "datetime" ? 
        <DatePicker
        style={{width: '100%', marginTop: 15}} date={this.state.date} mode="datetime" 
        placeholder="Select date and time" format={format} minDate={minDate} maxDate="2021-06-01 / 00:00" 
        confirmBtnText="Confirm" cancelBtnText="Cancel" customStyles={{
          dateIcon: {
            position: 'absolute',
            left: 0,
            top: 4,
            marginLeft: 0
            },
            dateInput: {
              marginLeft: 36,}
          }}
        onDateChange={(date) => {this.setState({date: date})}}
        /> :
        <DatePicker
        style={{width: '100%', marginTop: 15}} date={this.state.time} mode="time"
        placeholder="Select time" format={format}
        confirmBtnText="Confirm" cancelBtnText="Cancel" customStyles={{
          dateIcon: {
            position: 'absolute',
            left: 0,
            top: 4,
            marginLeft: 0
            },
            dateInput: {
              marginLeft: 36,}
          }}
        onDateChange={(time) => {this.setState({time: time})}}
        />
        return (
        <ScrollView>
          <Appbar.Header style={styles.appbar}>
            <Appbar.Content
              title="Add A New Task" color="white"
            />
          </Appbar.Header>
          <View style={styles.inputWrapper}>
            <Icon style={{marginRight: 6, paddingTop: 10}} size={30} name="bookmark" color="#00bfa5" />
            <View style={{flex: 1,padding: 0, flexDirection:'row', 
            margin: 0, borderWidth: 2, borderColor: '#ccc', borderRadius: 15}}>
              <TextInput placeholder="Title" style={styles.contactInput}
                value={this.state.title} onChangeText={title => this.setState({ title })} />
            </View>
          </View>
          <View style={styles.inputWrapper}>
            <Icon style={{marginRight: 6, paddingTop: 10}} size={30} name="contacts" color="#00bfa5" />
            <View style={{flex: 1,padding: 0, flexDirection:'row', 
            margin: 0, borderWidth: 2, borderColor: '#ccc', borderRadius: 15}}>
              <TextInput placeholder="To" style={styles.contactInput}
                value={this.state.contact} onChangeText={contact => this.setState({ contact })} />
              
              <TouchableOpacity onPress={this.pickContact}>
                <Icon style={{padding: 10,}} size={30} name="add-circle" color="#d50000" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputWrapper}>
            <Icon style={{marginRight: 6, paddingTop: 30}} size={30} name="message" color="#00bfa5" />
            <TextInput
              placeholder="Message" style={{flex: 1,
                padding: 10, fontSize: 15,
                color: '#424242', borderWidth: 2, borderColor: '#ccc', borderRadius: 15,
                height: 90, textAlignVertical:'top'}} multiline={true}
              value={this.state.message}
              onChangeText={message => this.setState({ message })}
            />
          </View>
          <RadioButton.Group
            onValueChange={mode => this.setState({ mode })}
            value={this.state.mode}>
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingRight: 20}}>
              <RadioButton value="datetime" />
              <Text>One Time</Text>
            </View >
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: 20}}>
              <RadioButton style={{flex: 1}} value="time" />
              <Text style={{flex: 1}}>Repeat</Text>
            </View>
          </View>
          </RadioButton.Group>
          <View style={{padding: 10}}>
            {datePicker}
          </View>
          {repeat}
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <Button style={{marginTop: 20, marginBottom: 20, width: 100, backgroundColor: '#ff9100'}} icon="save" mode="contained" onPress={this._handleSubmit}>
            Save
          </Button>
          </View>
        </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
  contactInput: {
    flex: 1,
    padding: 10,
    color: '#424242', width:'100%', marginRight: 0
  },
  inputWrapper: {
    flexDirection: 'row',
    marginLeft: 10, marginRight: 10, marginTop: 20, marginBottom: 10
  },
  appbar: {
    backgroundColor:"#00bfa5",
  }
})