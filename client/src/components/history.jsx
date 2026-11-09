import React from 'react';

class ShowHistory extends React.Component{
  render (){
    return(
      <div>
        <b>Naposledy zobrazeno</b>
      </div>
    )
  }

  }

  class ShowTable extends React.Component{
    render(){
      return(
            <table className="show-table">
                <tr>
                    <th>Odchod</th>
                    <th>Odkud</th>
                    <th>Prichod</th>
                    <th>Kam</th>
                    <th>Cena</th>
                </tr>
                <tr>
                    <td>a</td>
                    <td>a</td>
                    <td>a</td>
                    <td>a</td>
                    <td>a</td>
                </tr>
            </table>
      )
    }
  }

function History(){
  return(
    <>
    <div className="history-window">
      <ShowHistory>

      </ShowHistory>
    </div>
    <div>
      <ShowTable>
      </ShowTable>
    </div>
    </>
  );
}

export default History;
