import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";



const getFriend = asyncHandler(async (req, res) => {
  console.log('call hua')
  const user = req.user;

  let friends = await User
    .find({ _id: { $ne: user._id } })
    .select('name email avatar')
    .lean();

  await Promise.all(
    friends.map(async (ele) => {
      const lastMessage = await Message.findOne({
        $or: [
          { senderId: user._id, receiverId: ele._id },
          { senderId: ele._id, receiverId: user._id }
        ]
      }).sort({ createdAt: -1 });

      ele.lastMessage = lastMessage;
    })
  );

  res.status(200).json(new ApiResponse(200, 'friend fetched', friends));
});



export {
    getFriend
}