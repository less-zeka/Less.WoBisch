using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Security;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
using SignalRChat.Models;

namespace SignalRChat.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private static readonly ConcurrentDictionary<string, User> Users
            = new ConcurrentDictionary<string, User>(StringComparer.InvariantCultureIgnoreCase);

        //TOOD only for allowed users!
        public void UpdatePosition(string name, double latitude, double longitude)
        {
            //var geocoordinate = new GeoCoordinate(10, 10);
            Clients.All.updatePosition(name, latitude, longitude);
        }

        private string CurrentLogonUserIdentifier
        {
            get
            {
                if (Context.Request.Cookies != null)
                {
                    var cookie = Context.Request.Cookies[FormsAuthentication.FormsCookieName];

                    if (null == cookie)
                        return string.Empty;

                    var decrypted = FormsAuthentication.Decrypt(cookie.Value);

                    if (decrypted != null && !string.IsNullOrEmpty(decrypted.UserData))
                    {
                        var identifier = JsonConvert.DeserializeObject(decrypted.UserData);
                        return identifier.ToString();
                    }
                }
                return string.Empty;
            }
        }

        public void Send(string message)
        {
            var sender = GetUser(Context.User.Identity.Name);

            foreach (var user in Users)
            {
                var potentialReceiver = user.Value;
                if (potentialReceiver.Identifier == CurrentLogonUserIdentifier)
                {
                    Clients.User(user.Key).broadcastMessage(sender.Name, message);
                }
            }
        }

        //public void Send(string message, string to)
        //{
        //    if (string.IsNullOrEmpty(to))
        //    {
        //        var username = Context.User.Identity.Name;
        //        to = username == "user1" ? "user2" : "user1";
        //    }

        //    User receiver;
        //    if (Users.TryGetValue(to, out receiver))
        //    {
        //        User sender = GetUser(Context.User.Identity.Name);

        //        IEnumerable<string> allReceivers;
        //        lock (receiver.ConnectionIds)
        //        {
        //            lock (sender.ConnectionIds)
        //            {
        //                allReceivers = receiver.ConnectionIds.Concat(sender.ConnectionIds);
        //            }
        //        }

        //        foreach (var cid in allReceivers)
        //        {
        //            Clients.Client(cid).received(new {sender = sender.Name, message, isPrivate = true});
        //            Clients.User(to).broadcastMessage("test", message);

        //        }
        //    }
        //}

        public IEnumerable<string> GetConnectedUsers()
        {
            return Users.Where(x =>
            {
                lock (x.Value.ConnectionIds)
                {
                    return
                        !x.Value.ConnectionIds.Contains(Context.ConnectionId, StringComparer.InvariantCultureIgnoreCase);
                }
            }).Select(x => x.Key);
        }

        public override Task OnConnected()
        {
            var userName = Context.User.Identity.Name;
            var connectionId = Context.ConnectionId;
            var identifier = CurrentLogonUserIdentifier;

            var user = Users.GetOrAdd(userName, _ => new User
            {
                Name = userName,
                ConnectionIds = new HashSet<string>(),
                Identifier = identifier
            });

            lock (user.ConnectionIds)
            {
                user.ConnectionIds.Add(connectionId);

                // // broadcast this to all clients other than the caller
                // Clients.AllExcept(user.ConnectionIds.ToArray()).userConnected(userName);

                // Or you might want to only broadcast this info if this 
                // is the first connection of the user
                if (user.ConnectionIds.Count == 1)
                {
                    //TODO!
                    Clients.Others.userConnected(userName);
                }
            }

            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            var userName = Context.User.Identity.Name;
            var connectionId = Context.ConnectionId;

            User user;
            Users.TryGetValue(userName, out user);

            if (user != null)
            {
                lock (user.ConnectionIds)
                {
                    user.ConnectionIds.RemoveWhere(cid => cid.Equals(connectionId));

                    if (!user.ConnectionIds.Any())
                    {
                        User removedUser;
                        Users.TryRemove(userName, out removedUser);

                        // You might want to only broadcast this info if this 
                        // is the last connection of the user and the user actual is 
                        // now disconnected from all connections.
                        Clients.Others.userDisconnected(userName);
                    }
                }
            }

            return base.OnDisconnected(stopCalled);
        }

        public static User GetUser(string username)
        {
            User user;
            Users.TryGetValue(username, out user);

            return user;
        }
    }
}