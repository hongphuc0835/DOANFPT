using System.Collections.Generic;
using System.Threading.Tasks;
using userservice.Modes;

namespace userservice.Services
{
    public interface INewsService
    {
        Task<IEnumerable<News>> GetAllNewsAsync();
        Task<News> GetNewsByIdAsync(int id);
        Task<News> CreateNewsAsync(News news);
        Task<News> UpdateNewsAsync(int id, News news);
        Task<bool> DeleteNewsAsync(int id);
    }
}
