import React from "react";
import "./style.css";

const Addresses = () => {
    const onSubmit = (e) => {

    }

    return(
        <div>
            <p>Add new</p>
            <form onSubmit={onSubmit} action="/" method="post">
                <input type="text" name="address"/>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default Addresses