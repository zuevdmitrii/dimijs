import {useMemo} from 'react';
import {useLocation} from 'react-router';
import {useNavigate} from 'react-router-dom';

export const useLocationSearch = () => {
  const {search, pathname} = useLocation();
  const navigate = useNavigate();
  // URLSearchParams is not available in IE11
  const searchParams = useMemo(() => {
    const searchObject: {[propname: string]: string} = {};
    const elements = search.slice(1).split('&');
    elements.forEach((element) => {
      const data = element.split('=');
      if (data[0])
        searchObject[data[0]] = data[1];
    });

    return {
      params: searchObject,
      set: (name: string, value?: string | undefined) => {
        if (value === undefined) delete searchObject[name];
        else searchObject[name] = value;
        navigate(
          `${pathname}?${Object.keys(searchObject)
            .map((key) => {
              return `${key}=${searchObject[key]}`;
            })
            .join('&')}`
        );
      },
      getLinkWithParam: (name: string, value?: string | undefined) => {
        const temp = {...searchObject};
        if (value === undefined) delete temp[name];
        else temp[name] = value;
        return `${pathname}?${Object.keys(temp)
          .map((key) => {
            return `${key}=${temp[key]}`;
          })
          .join('&')}`;
      },
    };
  }, [search, pathname, navigate]);
  return searchParams;
};
