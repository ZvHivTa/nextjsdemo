
function Message() {
    const name  = 'Zhang'
    //JSX 语法
    if(name)
        return <h1>Hello, this is {name}</h1>;
    else
        return <h1>Hello, this is Guest</h1>;
}

export default Message;