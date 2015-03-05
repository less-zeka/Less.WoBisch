using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Security;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Newtonsoft.Json;
using SignalRChat.Models;

namespace SignalRChat.Hubs
{
    [Authorize]
    [HubName("chatAndFindHub")]
    public class ChatAndFindHub : Hub
    {
        private static readonly ConcurrentDictionary<string, User> Users
            = new ConcurrentDictionary<string, User>(StringComparer.InvariantCultureIgnoreCase);

        public void UpdatePosition(double latitude, double longitude)
        {
            var user = GetUser(Context.User.Identity.Name);

            foreach (var u in GetUsersByIdentifier(user.Identifier))
            {
                Clients.User(u.Name).updatePosition(Context.User.Identity.Name, latitude, longitude);
            }
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
            var users = GetUsersByIdentifier(sender.Identifier);
            foreach (var user in users)
            {
                Clients.User(user.Name).broadcastMessage(sender.Name, message);
            }
        }

        public static IEnumerable<User> GetUsersByIdentifier(string identifier)
        {
            return Users.Values.Where(user => user.Identifier == identifier).ToList();
        }

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

        //TODO that's bullshit!
        private string GetPinColor()
        {
            if (!string.IsNullOrEmpty(Context.User.Identity.Name))
            {
                var user = GetUser(Context.User.Identity.Name);
                if (user != null)
                {
                    var users = GetUsersByIdentifier(user.Identifier);

                    if (users != null)
                    {
                        var nrUsers = users.Count();

                        if (nrUsers == 0)
                        {
                            return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
                        }
                        if (nrUsers == 1)
                        {
                            return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
                        }
                        if (nrUsers == 2)
                        {
                            return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
                        }
                        if (nrUsers == 3)
                        {
                            return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
                        }
                        if (nrUsers == 4)
                        {
                            return "http://maps.google.com/mapfiles/ms/icons/purple-dot.png";
                        }
                        if (nrUsers == 5)
                        {
                            return "http://maps.google.com/mapfiles/ms/micons/ltblue-dot.png";
                        }
                        if (nrUsers == 6)
                        {
                            return "http://maps.google.com/mapfiles/ms/micons/orange-dot.png";
                        }
                    }
                    return "http://maps.google.com/mapfiles/ms/icons/pink-dot.png";
                }
            }
            return string.Empty;
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
                Identifier = identifier,
            });
            user.PinColor = GetPinColor();

            lock (user.ConnectionIds)
            {
                user.ConnectionIds.Add(connectionId);

                foreach (var u in GetUsersByIdentifier(user.Identifier))
                {
                    Clients.User(u.Name).updateConnectedUsers();
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

                        foreach (var u in GetUsersByIdentifier(user.Identifier))
                        {
                            Clients.User(u.Name).updateConnectedUsers();
                        }
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