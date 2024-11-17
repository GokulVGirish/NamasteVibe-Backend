import server from "./frameworks/express/app";

server.listen(process.env.PORT, () => {
  console.log(`server listening and is ready to go ${process.env.PORT}`);
});
