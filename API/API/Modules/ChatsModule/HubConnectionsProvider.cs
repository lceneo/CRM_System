using System.Collections.Concurrent;

namespace API.Modules.ChatsModule;

public class HubConnectionsProvider
{
    private readonly ConcurrentDictionary<Guid, bool> users;

    public HubConnectionsProvider()
    {
        users = new ConcurrentDictionary<Guid, bool>();
    }

    public void AddUser(Guid userId)
    {
        users.AddOrUpdate(userId, (userId) => true, (userId, value) => true);
    }

    public void RemoveUser(Guid userId)
    {
        users.Remove(userId, out var isRemoved);
    }

    public bool Contains(Guid userId)
    {
        return users.ContainsKey(userId);
    }
}