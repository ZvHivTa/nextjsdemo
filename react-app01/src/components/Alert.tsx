import { ReactNode } from "react";


interface Props{
    // children: string;
    //使用children属性传入子组件
    children: ReactNode;
    onClose: () => void;
}

const Alert = ({children,onClose}:Props) => {
  return (
    <div className="alert alert-primary alert-dismissable">
      {children}
      <button
        type="button"
        className="btn-close"
        data-bs-dismiss="alert"
        onClick={onClose}
      ></button>
    </div>
  );
}

export default Alert