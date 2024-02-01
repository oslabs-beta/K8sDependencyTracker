import React from 'react';
import { FaCheckCircle } from "react-icons/fa";
import { IoIosWarning } from "react-icons/io";
import { VscError } from "react-icons/vsc";

type RowProps = {
  api: string,
  location: string,
  status: string,
  stable: string,
  notes: string
}

export default function Row(props:RowProps):React.JSX.Element {
  let icon: any;
  if(props.status === 'stable'){
    icon = <FaCheckCircle className="icon"/>;
  } else if (props.status === 'deprecated'){
    icon = <IoIosWarning />
  } else{
    icon = <VscError />
  }

  //-------- Icons can be found here: https://react-icons.github.io/react-icons/search/#q=error --------//


  return (
      <div className='row'>
        <div className="api-info-api">{props.api}</div>
        <div className="api-info-location">{props.location}</div>
        <div className={"api-info-status-" + props.status}>
          {icon}    
          {props.status}
        </div>
        <div className="api-info-stable-version">{props.stable}</div>
        <div className={"api-info-notes"}>{props.notes}</div>
      </div>
    )
}