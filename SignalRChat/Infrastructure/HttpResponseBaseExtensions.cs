﻿using Newtonsoft.Json;
using System.Web;
using System.Web.Security;

namespace SignalRChat.Infrastructure
{
    public static class HttpResponseBaseExtensions
    {
        public static int SetAuthCookie<T>(this HttpResponseBase responseBase, string name, bool rememberMe, T userData)
        {
            // In order to pickup the settings from config, we create a default cookie and use its values to create a new one.
            var cookie = FormsAuthentication.GetAuthCookie(name, rememberMe);
            var ticket = FormsAuthentication.Decrypt(cookie.Value);

            if (ticket != null)
            {
                var newTicket = new FormsAuthenticationTicket(ticket.Version, ticket.Name, ticket.IssueDate,
                    ticket.Expiration,
                    ticket.IsPersistent, JsonConvert.SerializeObject(userData), ticket.CookiePath);
                var encTicket = FormsAuthentication.Encrypt(newTicket);

                // Use existing cookie. Could create new one but would have to copy settings over...
                cookie.Value = encTicket;

                responseBase.Cookies.Add(cookie);

                if (encTicket != null)
                {
                    return encTicket.Length;
                }
            }
            return 0;
        }
    }   
}