using System.Collections.Concurrent;

namespace API.Modules.CrmModule.Crm;

public class CrmHubConnectionsProvider
{
    private readonly ConcurrentDictionary<Guid, bool> users;

    public CrmHubConnectionsProvider()
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

    public Guid[] Users => users.Keys.ToArray();
}