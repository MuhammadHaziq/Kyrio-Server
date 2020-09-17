import Users from "../modals/users";

export  const getOwner = async (userid) => {
    try {
        let user = await Users.findOne({ _id: userid });
        if(user.owner_id !== "undefined" && user.owner_id !== ""){
            return {success: true, _id: user.owner_id}
        } else {
            return {success: false, message: "No Owner Found!"}
        }
    } catch (error) {
        return {success: false, message: error.message};
    }
}