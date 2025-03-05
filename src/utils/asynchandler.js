

const asynchandler = (requesthanler) => {
    return (req, res, next) => {
        Promise.resolve(requesthanler(req, res, next))
            .catch((err) => next(err));
    }
}


export { asynchandler };


// try-cath block to handle errors in async functions

// const asynchandler = (fn) => async (req , res , next) => {
//     try {
//         await fn(req , res , next);
//         } catch (error) {
//             res.status(err.code || 500).json({
//                 message: error.message,
//                 sucess: err.message 
//             });
//         }
// }