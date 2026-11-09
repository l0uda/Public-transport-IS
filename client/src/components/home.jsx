import React from "react";
import { PopupRegister } from "./popup";

export const GeneralErrorPage = () => {
  return (
    <h3>Obecná chyba. Nejsem si jistý proč se tohle stalo :(</h3>
  )
}

class SearchWithLabel extends React.Component{
  constructor(props){
    super(props);
    var today = new Date();
    
    // months are indexed from 0 for some reason
    this.dateNow = today.getFullYear() +'-'+ (today.getMonth()+1) +'-'+ today.getDate();
    this.timeNow = ("0" + today.getHours()).slice(-2) + ":" + 
                    ("0" + today.getMinutes()).slice(-2) + ":" +
                    ("0" + today.getSeconds()).slice(-2);
  }
  render(){
    console.log("timenow: ",this.timeNow) 
    console.log("datenow: ",this.dateNow)

    return(
      <form>
        <label htmlFor="search-from">Odkud</label>
        <input defaultValue="Simonova" type="text" id="search-from" name="from" placeholder="odkud..."></input>
        <label htmlFor="search-to">Kam</label>
        <input defaultValue="Honzova" type="text" id="search-to" name="to" placeholder="kam..."></input>

        <div className="row">
          <div className="column">
        <label htmlFor="search-date">Datum</label>
        <input type="date" id="search-date" name="date" defaultValue={this.dateNow} />
          </div>
          <div className="column">
        <label htmlFor="search-time">Čas</label>
        <input type="time" id="search-time" name="time" defaultValue={"01:01:01"} />
        {/* <input type="time" id="search-time" name="time" defaultValue={this.timeNow} /> */}
          </div>
        </div>
        <hr className="solid"/>
        <button type="button" onClick={this.props.funkca} className="button-submit">Vyhledat</button>
      </form>
    )
  }
}

class ShowTable extends React.Component{
  constructor(props){
    super(props);
    // set initial state
    this.state={
      usePOP:     false,
      connID:     0,
      priceRich:  0,
      pricePoor:  0
    } 
    // bind function
    this.handlePOP = this.handlePOP.bind(this)
    this.closePOP = this.closePOP.bind(this)
  }

  closePOP() {
    this.setState({ usePOP: false });
  }

  handlePOP(e,poor,rich) {
    console.log("INHANDLE:",poor,rich)
    // change the state whenever the button is pressed
    this.setState(prev => ({
      usePOP: !prev.usePOP,
      connID: e.target.id,
      pricePoor: poor,
      priceRich: rich
    }));

  }

    render(){
    return(
        <div>
          <table className="show-table">
              <thead>
                  <tr>
                    <th>Linka</th>
                    <th>Odchod</th>
                    <th>Odkud</th>
                    <th>Prichod</th>
                    <th>Kam</th>
                    <th>2. třída(Kč)</th>
                    <th>1. třída(Kč)</th>
                  </tr>
              </thead>
              <tbody>
                    {this.props.veci.map(comp => (
                      <tr key={comp[0]}>
                        {comp.map((compy,i) => <td key={i}>{compy}</td>)}
                        <td><button type='button' id={comp[0]} onClick={(e)=>this.handlePOP(e,comp[5],comp[6])} className="button-show">Jízdenky</button></td>
                      </tr>
                    ))}
              </tbody>
          </table>
          <PopupRegister trigger={this.state.usePOP} closePopup={this.closePOP} connID={this.state.connID} price={[this.state.pricePoor,this.state.priceRich]}/>
          </div>
    )
  }
}

class MainSearchBlock extends React.Component{

  render (){
    return (

      <div className="main-search-block">
        <div className="row-header">
          <b>VYHLEDEJ SPOJ</b>
        </div>
        <hr className = "solid" />
        <SearchWithLabel funkca={this.props.funkca} veci={this.props.veci}/>

      </div>
      )
  }
}

class Wrap extends React.Component{
    constructor(props){
        super(props);
        
        this.vyhledatSpoj = this.vyhledatSpoj.bind(this);
    }
    state = {
        veci: []
    }
    vyhledatSpoj() {
        var xhr = new XMLHttpRequest()
        var odkud = document.getElementById("search-from").value;
        var kam = document.getElementById("search-to").value;
        var kdy = document.getElementById("search-time").value;
        console.log(odkud,kam,kdy);
        // get a callback when the server responds
        xhr.addEventListener('load', () => {
        // update the state of the component with the result here
            var spoje = JSON.parse(xhr.responseText);
            var stateSpoje = [];
            for (let spoj of spoje){
                stateSpoje.push(Object.values(spoj));
            }
            console.log(stateSpoje);
            this.setState({veci: stateSpoje});
        })
        // open the request with the verb and the url
        xhr.open('GET', '/api/spoje?odkud='+odkud+'&kam='+kam+'&kdy='+kdy);
        // send the request
        xhr.send()
    }

    render (){
        return (
            <div>
            <div className="home-window">
            <MainSearchBlock funkca={this.vyhledatSpoj} veci={this.state.veci}/>
        </div>
        <div className="">
        <ShowTable veci={this.state.veci}/>
        </div>
        </div>
        )
  }
}

function Home() {
    return (
    <>
      <Wrap />
    </>
  );
}

export default Home;
