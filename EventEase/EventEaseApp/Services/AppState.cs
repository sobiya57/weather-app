using EventEaseApp.Models;

namespace EventEaseApp.Services
{
    public class AppState
    {
        private readonly List<RegistrationModel> _registrations = new();

        // Expose registrations as read-only
        public IReadOnlyList<RegistrationModel> Registrations => _registrations;

        // Event to notify components when state changes
        public event Action? OnChange;

        // Add a new registration and notify listeners
        public void AddRegistration(RegistrationModel reg)
        {
            _registrations.Add(reg);
            OnChange?.Invoke();
        }

        // Get all registrations for a specific event
        public IEnumerable<RegistrationModel> GetByEvent(int eventId) =>
            _registrations.Where(r => r.EventId == eventId);
    }
}
