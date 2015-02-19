using Microsoft.AspNet.SignalR;
using System.Device.Location;

namespace SignalRChat
{
    public class ChatHub : Hub
    {
        public void Send(string name, string message)
        {
            // Call the broadcastMessage method to update clients.
            Clients.All.broadcastMessage(name, message);
        }

        public void UpdatePosition(string name, double latitude, double longitude)
        {
            //var geocoordinate = new GeoCoordinate(10, 10);
            Clients.All.updatePosition(name, latitude, longitude);
        }
    }
}