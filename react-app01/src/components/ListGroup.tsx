import { MouseEvent, useState } from "react";

//定义属性类型,typescript语法
interface Props {
    items: string[];
    heading: string;
    //函数签名
    onSelectItem: (item: string) => void;
}

//import } from "react/jsx-runtime";

// react.createElement('ul', {className: 'list-group'}, ...)
//因此我们不允许在return中返回多个元素
//用Fragment来包裹
function ListGroup({items,heading,onSelectItem}:Props) {    
    
    
    //let selectedIndex = 0;
    //钩子函数
    const [selectedIndex,setSelectedIndex] = useState(-1);
    

    //items = []; //test empty list

    
    // if(items.length === 0) 
    //     return (
    //       <>
    //         <h1>List</h1>
    //         <p>No item found</p>
    //       </>
    //     ); 
    
    //用常量去移除return中的标记
    //const message = items.length === 0 ? <p>No item found</p> : null;

    //用函数去移除return中的标记
    // const getMessage = (这可以写参数去动态展示) => {
    //     return items.length === 0 ? <p>No item found</p> : null;
    
    // }

    const handleClick = (event: MouseEvent) => console.log(event.type);

    return (
      <>
        <h1>List</h1>
        {/* {message} */}
        {/* {getMessage()} */}
        {/* {items.length === 0 ? <p>No item found</p> : null} */}

        {items.length === 0 && <p>No item found</p>}
        <ul className="list-group">
          {items.map((item,index) => (
            <li
              key={item}
              className={selectedIndex === index ? 'list-group-item active' : 'list-group-item'}
              onClick={() => {
                setSelectedIndex(index);
                onSelectItem(item);
            }}
            >
              {item}
            </li>
          ))}
        </ul>
      </>
    );
}

export default ListGroup;