using userservice.Modes;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using userservice.Data;

namespace userservice.Services
{
    public class NewsService : INewsService
    {
        private readonly APIContext _context;


        public NewsService(APIContext context)
        {
            _context = context;
        }


        public async Task<IEnumerable<News>> GetAllNewsAsync()
        {
            return await _context.News.ToListAsync();
        }

        public async Task<News> GetNewsByIdAsync(int id)
        {
            return await _context.News.FindAsync(id);
        }

        // Phương thức tạo mới bài viết tin tức
        public async Task<News> CreateNewsAsync(News news)
        {
             news.PublishedDate = DateTime.Now;
            _context.News.Add(news);
            await _context.SaveChangesAsync();
            return news;
        }


        public async Task<News> UpdateNewsAsync(int id, News news)
        {
            var existingNews = await _context.News.FindAsync(id);
            if (existingNews == null)
                return null;


            existingNews.Title = news.Title;
            existingNews.Author = news.Author;
            existingNews.Content = news.Content;
            existingNews.Summary = news.Summary;
            existingNews.ImageUrl = news.ImageUrl;
            existingNews.UpdatedDate =DateTime.Now;

            await _context.SaveChangesAsync();
            return existingNews;
        }


        public async Task<bool> DeleteNewsAsync(int id)
        {
            var news = await _context.News.FindAsync(id);
            if (news == null)
                return false;

            _context.News.Remove(news);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
