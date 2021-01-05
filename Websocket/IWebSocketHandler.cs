using System;
using System.Net.WebSockets;
using System.Threading.Tasks;

namespace XandOs2Player.Websocket
{
    public interface IWebsocketHandler
    {
        Task Handle(Guid id, WebSocket websocket);
    }
}