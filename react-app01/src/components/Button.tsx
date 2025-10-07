import PropTypes from 'prop-types'
import React, { Component, useState } from 'react'

interface Props {

    name: string[];
    //函数签名
    onClickButton: (item: string) => void;
}

function Button({name, onClickButton}:Props) {
    const [clickTimes,setClickTimes] = useState(0);
    return (
      <button key = {name[clickTimes % 8]} type="button" className={name[clickTimes % 8]} onClick={() => {
        setClickTimes(clickTimes + 1);
        onClickButton(name[(clickTimes + 1) % 8]);
      }}>
        {name[clickTimes % 8]}
      </button>
    );
};
export default Button